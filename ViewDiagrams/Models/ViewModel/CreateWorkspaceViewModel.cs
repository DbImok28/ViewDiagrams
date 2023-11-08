using System.ComponentModel.DataAnnotations;

namespace ViewDiagrams.Models.ViewModel
{
	public class CreateWorkspaceViewModel
	{
		[MaxLength(32)]
		public string Name { get; set; }
	}
}
