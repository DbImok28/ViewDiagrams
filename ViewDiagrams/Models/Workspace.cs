using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ViewDiagrams.Models
{
    public class Workspace
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = "Blank workspace";

        public virtual ICollection<User> Users { get; set; }
        public virtual ICollection<WorkspaceUser> WorkspaceUsers { get; set; }

        public bool IsPublic { get; set; } = false;

        public string Test { get; set; } = "test";
        public bool UseTest { get; set; } = false;
        public int UseTest2 { get; set; } = 0;

        public Workspace Update(Workspace newWorkspace, bool isAdmin)
        {
            Name = newWorkspace.Name;
            if (!isAdmin)
            {
                newWorkspace.IsPublic = IsPublic;
                newWorkspace.Test = Test;
                newWorkspace.UseTest = UseTest;
                newWorkspace.UseTest2 = UseTest2;
            }
            return newWorkspace;
        }
    }
}
