using Microsoft.AspNetCore.Identity;

namespace ViewDiagrams.Models
{
	public class User : IdentityUser<int>
	{
		public virtual ICollection<Workspace> Workspaces { get; set; }
		public virtual ICollection<WorkspaceUser> WorkspaceUsers { get; set; }
	}
}
