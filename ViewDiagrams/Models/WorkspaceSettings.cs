using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ViewDiagrams.Models
{
	public class WorkspaceSettings
	{
		[Key]
		[JsonIgnore]
		public int Id { get; set; }
		public string Name { get; set; } = "Empty workspace";
	}
}
