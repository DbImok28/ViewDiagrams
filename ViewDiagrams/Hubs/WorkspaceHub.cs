using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using ViewDiagrams.Models;
using ViewDiagrams.Models.Helpers;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ViewDiagrams.Hubs
{
    public class WorkspaceHub : Hub
    {
        private readonly WorkspaceHubHelpers _helper;

        public WorkspaceHub(ApplicationDbContext context)
        {
            _helper = new WorkspaceHubHelpers(context);
        }

        public async Task Sink(string data, string documentInJson)
        {
            int workspaceId = _helper.GetWorkspaceId(Context);
            var role = _helper.GetUserRole(Context, workspaceId);

            _helper.CheckPrivateAccess(role);

            Workspace? newWorkspace;
            try
            {
                newWorkspace = JsonSerializer.Deserialize<Workspace>(data.ToString());
            }
            catch (JsonException e)
            {
                throw new HubException(e.Message);
            }
            if (newWorkspace == null) return;
            newWorkspace.DocumentInJson = documentInJson;

            var workspace = _helper.GetWorkspace(workspaceId);
            workspace.Update(newWorkspace, role == WorkspaceUserRole.Admin);

            newWorkspace.Id = workspaceId;
            try
            {
                _helper.SaveWorkspaceChanges();
            }
            catch (Exception e)
            {
                throw new HubException(e.Message);
            }
            await Clients.OthersInGroup(workspaceId.ToString()).SendAsync("Update", data, documentInJson);
        }

        public async Task Pull()
        {
            int workspaceId = _helper.GetWorkspaceId(Context);
            Workspace workspace = _helper.GetWorkspace(workspaceId);

            //CheckPublicAccess(workspace);

            string settingsAsJson = JsonSerializer.Serialize(workspace);
            if (settingsAsJson == null) return;
            await Clients.Caller.SendAsync("Update", settingsAsJson, workspace.DocumentInJson);

        }

        public async Task Join(string newWorkspaceId)
        {
            await Leave();

            int workspaceId = Convert.ToInt32(newWorkspaceId);
            Workspace workspace = _helper.GetWorkspace(workspaceId);

            _helper.CheckPublicAccess(Context, workspace);

            Context.Items["WorkspaceId"] = workspaceId;
            await Groups.AddToGroupAsync(Context.ConnectionId, workspaceId.ToString());
        }

        public async Task Leave()
        {
            if (Context.Items["WorkspaceId"] is int workspaceId)
            {
                Context.Items.Remove(workspaceId);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, workspaceId.ToString());
            }
        }

        public async Task UserList()
        {
            Workspace workspace = _helper.GetWorkspace(_helper.GetWorkspaceId(Context));
            _helper.LoadUsers(workspace);
            try
            {
                var userInJson = JsonSerializer.Serialize(workspace.Users.Select(x => x.UserName));
                await Clients.Caller.SendAsync("UserListResult", userInJson);
            }
            catch (JsonException e)
            {
                throw new HubException(e.Message);
            }
        }

        public void AddUser(string name)
        {
            _helper.CheckAdminAccess(Context);
            _helper.AddUser(_helper.GetWorkspaceId(Context), name);
        }

        public void RemoveUser(string name)
        {
            _helper.RemoveUser(_helper.GetWorkspaceId(Context), name);
        }
    }
}
