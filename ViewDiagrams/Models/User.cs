using System.ComponentModel.DataAnnotations;

namespace ViewDiagrams.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Mail { get; set; }
        public string Password { get; set; }

        public ICollection<Workspace> Workspaces { get; set; }
    }
}
