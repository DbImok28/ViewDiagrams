namespace ViewDiagrams.Models
{
    public class WorkspaceUser
    {
        public int WorkspaceId { get; set; }
        public Workspace Workspace { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public bool IsAdmin { get; set; } = false;
    }
}
