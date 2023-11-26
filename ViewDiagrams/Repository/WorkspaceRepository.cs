using System.Data;
using System.Security.Claims;
using ViewDiagrams.Models;
using ViewDiagrams.Models.Database;
using ViewDiagrams.Models.Helpers;

namespace ViewDiagrams.Repository
{
    public class WorkspaceRepository : IRepository<Workspace>
    {
        private readonly ApplicationDbContext _context;

        public WorkspaceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public void Create(Workspace entity)
        {
            _context.Workspaces.Add(entity);
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

        public void Delete(Workspace entity)
        {
            _context.Workspaces.Remove(entity);
            _context.SaveChanges();
        }

        public Workspace Get(int id)
        {
            return Get(x => x.Id == id);
        }

        public Workspace Get(Func<Workspace, bool> selector)
        {
            return _context.Workspaces.Single(selector);
        }

        public IEnumerable<Workspace> Select(Func<Workspace, bool> selector)
        {
            return _context.Workspaces.Where(selector);
        }

        public WorkspaceUser? GetWorkspaceUser(int userId, int workspaceId)
        {
            return _context.WorkspaceUsers.SingleOrDefault(x => x.WorkspaceId == workspaceId && x.UserId == userId);
        }

        public void Update(Workspace workspace, string documentInJson, bool isAdmin, Workspace oldWorkspace)
        {
            workspace.DocumentInJson = documentInJson;
            oldWorkspace.Update(workspace, isAdmin);
            workspace.Id = oldWorkspace.Id;
            _context.SaveChanges();
        }

        public WorkspaceUserRole GetUserRole(ClaimsPrincipal claims, int workspaceId)
        {
            if (claims.Identity == null || !claims.Identity.IsAuthenticated)
                return WorkspaceUserRole.Guest;

            var userId = claims.GetUserId();
            if (userId == null) return WorkspaceUserRole.Guest;

            var workspaceUser = GetWorkspaceUser(userId.Value, workspaceId);
            if (workspaceUser == null) return WorkspaceUserRole.Guest;

            if (workspaceUser.IsAdmin) return WorkspaceUserRole.Admin;
            return WorkspaceUserRole.User;
        }

        public bool IsAdmin(int userId, int workspaceId)
        {
            var user = GetWorkspaceUser(userId, workspaceId);
            return user == null ? false : user.IsAdmin;
        }

        public bool IsGuest(ClaimsPrincipal claims, int workspaceId)
        {
            return GetUserRole(claims, workspaceId) == WorkspaceUserRole.Guest;
        }

        public void LoadUsers(Workspace workspace)
        {
            _context.Entry(workspace)
            .Collection(c => c.Users)
            .Load();
        }

        public IEnumerable<User> GetUsers(Workspace workspace)
        {
            LoadUsers(workspace);
            return workspace.Users;
        }

        public void AddUser(int workspaceId, string name)
        {
            var user = _context.Users.Single(x => x.UserName == name);
            var workspace = _context.Workspaces.Single(x => x.Id == workspaceId);
            _context.WorkspaceUsers.Add(new WorkspaceUser() { User = user, Workspace = workspace });
            _context.SaveChanges();
        }

        public void RemoveUser(int workspaceId, string name)
        {
            var user = _context.Users.Single(x => x.UserName == name);
            var workspaceUser = _context.WorkspaceUsers.Single(x => x.WorkspaceId == workspaceId && x.UserId == user.Id);
            _context.WorkspaceUsers.Remove(workspaceUser);
            _context.SaveChanges();
        }
    }
}
