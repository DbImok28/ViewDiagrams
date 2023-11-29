using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ViewDiagrams.Models;
using ViewDiagrams.Models.Database;
using ViewDiagrams.Models.Helpers;
using ViewDiagrams.Models.ViewModel;
using ViewDiagrams.Repository;

namespace ViewDiagrams.Controllers
{
	public class AccountController : Controller
	{
		private readonly UserManager<User> _userManager;
		private readonly SignInManager<User> _signInManager;
		private readonly ApplicationDbContext _context;

		public AccountController(UserManager<User> userManager, SignInManager<User> signInManager, ApplicationDbContext context)
		{
			_userManager = userManager;
			_signInManager = signInManager;
			_context = context;
		}

		public IActionResult Login()
		{
			LoginViewModel loginViewModel = new LoginViewModel();
			return View(loginViewModel);
		}

		[HttpPost]
		public async Task<IActionResult> Login(LoginViewModel loginViewModel)
		{
			if (!ModelState.IsValid) return View(loginViewModel);

			var user = await _userManager.FindByEmailAsync(loginViewModel.Email);
			if (user != null)
			{
				var passwordCheck = await _userManager.CheckPasswordAsync(user, loginViewModel.Password);
				if (passwordCheck)
				{
					var result = await _signInManager.PasswordSignInAsync(user, loginViewModel.Password, loginViewModel.RememberPassword, false);
					if (result.Succeeded)
					{
						return RedirectToAction(nameof(WorkspaceController.Index), nameof(WorkspaceController).Replace("Controller", ""));
					}
				}
			}
			TempData["Error"] = "Wrong credentials. Please try again.";
			return View(loginViewModel);
		}

		public IActionResult Register()
		{
			RegisterViewModel registerViewModel = new RegisterViewModel();
			return View(registerViewModel);
		}

		[HttpPost]
		public async Task<IActionResult> Register(RegisterViewModel registerViewModel)
		{
			if (!ModelState.IsValid) return View(registerViewModel);

			var user = await _userManager.FindByEmailAsync(registerViewModel.Email);
			if (user != null)
			{
				TempData["Error"] = "This email address is already in use.";
				return View(registerViewModel);
			}

			var newUser = new User()
			{
				Email = registerViewModel.Email,
				UserName = registerViewModel.Username,
				EmailConfirmed = true,
			};

			var newUserResponce = await _userManager.CreateAsync(newUser, registerViewModel.Password);
			if (!newUserResponce.Succeeded)
			{
				TempData["Error"] = newUserResponce.Errors.First().Description;
				return View(registerViewModel);
			}
			await _signInManager.SignInAsync(newUser, registerViewModel.RememberPassword);
			return RedirectToAction(nameof(WorkspaceController.Index), nameof(WorkspaceController).Replace("Controller", ""));
		}

		//private async void SendConfirmEmail(User user)
		//{
		//	var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
		//	var callbackUrl = Url.Action(
		//		nameof(ConfirmEmail),
		//		nameof(AccountController),
		//		new { userId = user.Id, code = code },
		//		protocol: HttpContext.Request.Scheme);

		//	var emailService = new EmailService();
		//	await emailService.SendEmailAsync(user.Email, "Confirm your account",
		//		$"Подтвердите регистрацию, перейдя по ссылке: <a href='{callbackUrl}'>link</a>");

		//	return Content("Для завершения регистрации проверьте электронную почту и перейдите по ссылке, указанной в письме");
		//}

		[HttpGet]
		public async Task<IActionResult> ConfirmEmail(string userId, string code)
		{
			if (userId == null || code == null)
			{
				return View("Error");
			}
			var user = await _userManager.FindByIdAsync(userId);
			if (user == null)
			{
				return View("Error");
			}
			var result = await _userManager.ConfirmEmailAsync(user, code);
			if (result.Succeeded)
				return RedirectToAction(nameof(WorkspaceController.Index), nameof(WorkspaceController).Replace("Controller", ""));
			else
				return View("Error");
		}

		[Authorize]
		public async Task<IActionResult> Logout()
		{
			await _signInManager.SignOutAsync();
			return RedirectToAction(nameof(Login));
		}

		[Authorize]
		public IActionResult Profile()
		{
			var userRepository = new UserRepository(_context);
			var userId = User.GetUserId();
			if (userId is null) return RedirectToAction(nameof(Login));

			var user = userRepository.Get(userId.Value);
			userRepository.LoadWorkspaces(user);
			return View(new ProfileViewModel(user));
		}
	}
}
