using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ViewDiagrams.Models
{
    public class AccessSettings
    {
        [Key]
        [JsonIgnore]
        public int Id { get; set; }
        public string Test { get; set; } = "test";
        public bool UseTest { get; set; } = false;
        public int UseTest2 { get; set; } = 0;
    }
}
