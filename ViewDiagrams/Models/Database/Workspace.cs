using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ViewDiagrams.Models
{
    public class Workspace
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = "Blank workspace";

        [JsonIgnore]
        public virtual ICollection<User> Users { get; set; }
        [JsonIgnore]
        public virtual ICollection<WorkspaceUser> WorkspaceUsers { get; set; }

        public bool IsPublic { get; set; } = false;

        [JsonIgnore]
        public string DocumentInJson { get; set; } = "\"Diagrams\": [{}]";

        public string Test { get; set; } = "test";
        public bool UseTest { get; set; } = false;
        public int UseTest2 { get; set; } = 0;

        public Workspace Update(Workspace newWorkspace, bool isAdmin)
        {
            Name = newWorkspace.Name;
            DocumentInJson = newWorkspace.DocumentInJson;
            if (isAdmin)
            {
                IsPublic = newWorkspace.IsPublic;
                Test = newWorkspace.Test;
                UseTest = newWorkspace.UseTest;
                UseTest2 = newWorkspace.UseTest2;
            }
            return newWorkspace;
        }
    }
}
