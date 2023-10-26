using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ViewDiagrams.Models
{
    public class Workspace
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }

        public ICollection<User> Users { get; set; }

        [ForeignKey("Settings")]
        public int SettingsId { get; set; }
        public Settings Settings { get; set; }
    }
}
