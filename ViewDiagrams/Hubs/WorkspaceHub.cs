using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using ViewDiagrams.Models;
using ViewDiagrams.Models.Repository;

namespace ViewDiagrams.Hubs
{
    public class WorkspaceHub : Hub
    {
        private readonly WorkspaceRepository _workspaceRepository;

        public WorkspaceHub(ApplicationDbContext context)
        {
            _workspaceRepository = new WorkspaceRepository(context);
        }

        public int GetWorkspaceId()
        {
            if (Context.Items["WorkspaceId"] is int workspaceId)
            {
                return workspaceId;
            }
            throw new HubException("The user is not connected to the workspace");
        }

        public Workspace GetWorkspace(int workspaceId)
        {
            Workspace? workspace = _workspaceRepository.GetWorkspace(workspaceId);
            if (workspace == null) throw new HubException("Workspace does not exist");
            return workspace;
        }

        public WorkspaceUserRole GetUserRole(int workspaceId)
        {
            if (Context.User == null) return WorkspaceUserRole.Guest;
            return _workspaceRepository.GetUserRole(Context.User, workspaceId);
        }

        public void CheckPrivateAccess(WorkspaceUserRole role)
        {
            if (role == WorkspaceUserRole.Guest) throw new HubException("Access is denied");
        }

        public void CheckPublicAccess(Workspace workspace)
        {
            if ((Context.User == null || _workspaceRepository.IsGuest(Context.User, workspace.Id))
                && !workspace.IsPublic) throw new HubException("Access is denied");
        }

        public async Task Sink(string data, string documentInJson)
        {
            int workspaceId = GetWorkspaceId();
            var role = GetUserRole(workspaceId);

            CheckPrivateAccess(role);

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

            var workspace = GetWorkspace(workspaceId);
            workspace.Update(newWorkspace, role == WorkspaceUserRole.Admin);

            newWorkspace.Id = workspaceId;
            try
            {
                _workspaceRepository.SaveChanges();
            }
            catch (Exception e)
            {
                throw new HubException(e.Message);
            }
            await Clients.OthersInGroup(workspaceId.ToString()).SendAsync("Update", data, documentInJson);
        }

        public async Task Pull()
        {
            int workspaceId = GetWorkspaceId();
            Workspace workspace = GetWorkspace(workspaceId);

            //CheckPublicAccess(workspace);

            string settingsAsJson = JsonSerializer.Serialize(workspace);
            if (settingsAsJson == null) return;
            await Clients.Caller.SendAsync("Update", settingsAsJson, workspace.DocumentInJson);

        }

        public async Task Join(string newWorkspaceId)
        {
            await Leave();

            int workspaceId = Convert.ToInt32(newWorkspaceId);
            Workspace workspace = GetWorkspace(workspaceId);

            CheckPublicAccess(workspace);

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
    }
}
