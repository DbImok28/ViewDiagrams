namespace ViewDiagrams.Models.Repository
{
    public class WorkspaceRepository
    {
        private readonly ApplicationDbContext _context;

        public WorkspaceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public bool CheckAccessToWorkspace(int userId, int workspaceId)
        {
            return _context.WorkspaceUsers.SingleOrDefault(x => x.WorkspaceId == workspaceId && x.UserId == userId) != null;
        }

        public Workspace? GetWorkspace(int workspaceId)
        {
            return _context.Workspaces.SingleOrDefault(x => x.Id == workspaceId);
        }

        public void UpdateWorkspace(Workspace workspace)
        {
            _context.Workspaces.Update(workspace);
            _context.SaveChanges();
        }

        public int Create(string name, int userId)
        {
            var workspace = new Workspace() { Name = name };
            var user = _context.Users.Single(x => x.Id == userId);
            _context.Workspaces.Add(workspace);
            _context.WorkspaceUsers.Add(new WorkspaceUser() { Workspace = workspace, User = user });
            _context.SaveChanges();
            return workspace.Id;
        }
    }
}
