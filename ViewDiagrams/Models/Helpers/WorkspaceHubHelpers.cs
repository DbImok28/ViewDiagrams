﻿using Microsoft.AspNetCore.SignalR;
using ViewDiagrams.Models.Database;
using ViewDiagrams.Repository;

namespace ViewDiagrams.Models.Helpers
{
    public class WorkspaceHubHelpers
    {
        private readonly WorkspaceRepository _workspaceRepository;

        public WorkspaceHubHelpers(ApplicationDbContext dbContext)
        {
            _workspaceRepository = new WorkspaceRepository(dbContext);
        }

        public int GetWorkspaceId(HubCallerContext hubContext)
        {
            if (hubContext.Items["WorkspaceId"] is int workspaceId)
            {
                return workspaceId;
            }
            throw new HubException("The user is not connected to the workspace");
        }

        public Workspace GetWorkspace(int workspaceId)
        {
            Workspace? workspace = _workspaceRepository.Get(workspaceId);
            if (workspace == null) throw new HubException("Workspace does not exist");
            return workspace;
        }

        public WorkspaceUserRole GetUserRole(HubCallerContext hubContext, int workspaceId)
        {
            if (hubContext.User == null) return WorkspaceUserRole.Guest;
            return _workspaceRepository.GetUserRole(hubContext.User, workspaceId);
        }

        public void Update(Workspace workspace, string documentInJson, bool isAdmin, Workspace oldWorkspace)
        {
            _workspaceRepository.Update(workspace, documentInJson, isAdmin, oldWorkspace);
        }

        public void CheckAdminAccess(HubCallerContext hubContext)
        {
            var userId = hubContext.User?.GetUserId();
            if (userId == null || !_workspaceRepository.IsAdmin(userId.Value, GetWorkspaceId(hubContext))) throw new HubException("Access is denied");
        }

        public void CheckPrivateAccess(WorkspaceUserRole role)
        {
            if (role == WorkspaceUserRole.Guest) throw new HubException("Access is denied");
        }

        public void CheckPublicAccess(HubCallerContext hubContext, Workspace workspace)
        {
            if ((hubContext.User == null || _workspaceRepository.IsGuest(hubContext.User, workspace.Id))
                && !workspace.IsPublic) throw new HubException("Access is denied");
        }

        public IEnumerable<User> GetUsers(Workspace workspace)
        {
            return _workspaceRepository.GetUsers(workspace);
        }

        public void AddUser(int workspaceId, string name)
        {
            _workspaceRepository.AddUser(workspaceId, name);
        }

        public void RemoveUser(int workspaceId, string name)
        {
            _workspaceRepository.RemoveUser(workspaceId, name);
        }
    }
}
