using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using System.Text.Json;
using ViewDiagrams.Models;
using ViewDiagrams.Models.Helpers;
using ViewDiagrams.Models.Repository;

namespace ViewDiagrams.Hubs
{
    public class WorkspaceHub : Hub
    {
        private readonly WorkspaceRepository _workspaceRepository;
        private readonly UserManager<User> _userManager;

        public WorkspaceHub(ApplicationDbContext context, UserManager<User> userManager)
        {
            _workspaceRepository = new WorkspaceRepository(context);
            _userManager = userManager;
        }

        public int GetWorkspaceId()
        {
            if (Context.Items["WorkspaceId"] is int workspaceId)
            {
                return workspaceId;
            }
            throw new HubException("The user is not connected to the workspace");
        }

        public void CheckAccessToWorkspace(int workspaceId)
        {
            if (Context.User != null && !_workspaceRepository.CheckAccessToWorkspace(Context.User.GetUserId(), Convert.ToInt32(workspaceId))) throw new HubException("Access is denied");
        }

        public Workspace GetWorkspace(int workspaceId)
        {
            Workspace? workspace = _workspaceRepository.GetWorkspace(workspaceId);
            if (workspace == null) throw new HubException("Workspace does not exist");
            return workspace;
        }

        public async Task Sink(string data)
        {
            int workspaceId = GetWorkspaceId();

            // TODO: Store workspace
            //Workspace workspace = GetWorkspace(workspaceId);

            var newWorkspace = JsonSerializer.Deserialize<Workspace>(data.ToString());
            if (newWorkspace == null) return;

            newWorkspace.Id = workspaceId;

            _workspaceRepository.UpdateWorkspace(newWorkspace);
            await Clients.OthersInGroup(workspaceId.ToString()).SendAsync("Update", data);

        }

        public async Task Pull()
        {
            int workspaceId = GetWorkspaceId();

            // TODO: Load workspace
            Workspace workspace = GetWorkspace(workspaceId);

            string settingsAsJson = JsonSerializer.Serialize(workspace);
            if (settingsAsJson == null) return;

            await Clients.Caller.SendAsync("Update", settingsAsJson);
        }

        public async Task Join(string newWorkspaceId)
        {
            // TODO: Check workspace access
            await Leave();

            int workspaceId = Convert.ToInt32(newWorkspaceId);
            CheckAccessToWorkspace(workspaceId);

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
