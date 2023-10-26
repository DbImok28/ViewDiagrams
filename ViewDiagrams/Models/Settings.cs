using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ViewDiagrams.Models
{
    public class Settings
    {
        [Key]
        [JsonIgnore]
        public int Id { get; set; }

        [ForeignKey("AccessSettings")]
        [JsonIgnore]
        public int AccessSettingsId { get; set; }
        public AccessSettings AccessSettings { get; set; } = new AccessSettings();
    }
}
