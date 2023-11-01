using System.ComponentModel.DataAnnotations;

namespace ViewDiagrams.Models.ViewModel
{
	public class RegisterViewModel
	{
		[Required(ErrorMessage = "User name is required")]
		[MaxLength(20)]
		public string Username { get; set; }

		[Required(ErrorMessage = "Email address is required")]
		[MaxLength(60)]
		[DataType(DataType.EmailAddress)]
		public string Email { get; set; }

		[Required(ErrorMessage = "Password is required")]
		[MaxLength(80)]
		[DataType(DataType.Password)]
		public string Password { get; set; }

		[Display(Name = "Confirm password")]
		[Required(ErrorMessage = "Confirm password is required")]
		[DataType(DataType.Password)]
		[Compare("Password", ErrorMessage = "Password do not match")]
		public string ConfirmPassword { get; set; }

		public bool RememberPassword { get; set; }
	}
}
