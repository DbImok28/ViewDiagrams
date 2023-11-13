using System.Security.Claims;
using ViewDiagrams.Models.Helpers;

namespace ViewDiagrams.Models.Repository
{
    public class WorkspaceRepository
    {
        private readonly ApplicationDbContext _context;

        public WorkspaceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public Workspace? GetWorkspace(int workspaceId)
        {
            return _context.Workspaces.SingleOrDefault(x => x.Id == workspaceId);
        }

        public void SaveChanges()
        {
            _context.SaveChanges();
        }

        public int Create(string name, int userId)
        {
            var workspace = new Workspace() { Name = name };
            var user = _context.Users.Single(x => x.Id == userId);
            _context.Workspaces.Add(workspace);
            _context.WorkspaceUsers.Add(new WorkspaceUser() { Workspace = workspace, User = user, IsAdmin = true });
            _context.SaveChanges();
            return workspace.Id;
        }

        public WorkspaceUser? GetWorkspaceUser(int userId, int workspaceId)
        {
            return _context.WorkspaceUsers.SingleOrDefault(x => x.WorkspaceId == workspaceId && x.UserId == userId);
        }

        public bool IsAdmin(int userId, int workspaceId)
        {
            var user = GetWorkspaceUser(userId, workspaceId);
            return user == null ? false : user.IsAdmin;
        }

        public WorkspaceUserRole GetUserRole(ClaimsPrincipal claims, int workspaceId)
        {
            if (claims.Identity == null || !claims.Identity.IsAuthenticated)
                return WorkspaceUserRole.Guest;

            var workspaceUser = GetWorkspaceUser(claims.GetUserId(), workspaceId);
            if (workspaceUser == null) return WorkspaceUserRole.Guest;

            if (workspaceUser.IsAdmin) return WorkspaceUserRole.Admin;
            return WorkspaceUserRole.User;
        }

        public bool IsGuest(ClaimsPrincipal claims, int workspaceId)
        {
            return GetUserRole(claims, workspaceId) == WorkspaceUserRole.Guest;
        }
    }
}
