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

        public Workspace Update(Workspace newWorkspace, bool isAdmin)
        {
            Name = newWorkspace.Name;
            DocumentInJson = newWorkspace.DocumentInJson;
            if (isAdmin)
            {
                IsPublic = newWorkspace.IsPublic;
            }
            return newWorkspace;
        }
    }
}
