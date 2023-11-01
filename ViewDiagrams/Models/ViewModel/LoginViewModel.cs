using System.ComponentModel.DataAnnotations;

namespace ViewDiagrams.Models.ViewModel
{
	public class LoginViewModel
	{
		[Required(ErrorMessage = "Email address is required")]
		[MaxLength(60)]
		[DataType(DataType.EmailAddress)]
		public string Email { get; set; }

		[Required(ErrorMessage = "Password is required")]
		[MaxLength(80)]
		[DataType(DataType.Password)]
		public string Password { get; set; }

		public bool RememberPassword { get; set; }
	}
}
