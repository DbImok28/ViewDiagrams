using lab3_identity.Models;
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

		public IActionResult Register(string? returnUrl = null) => View(new RegisterViewModel() { ReturnUrl = returnUrl });

		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> Register(RegisterViewModel model)
		{
			if (!ModelState.IsValid) return View(model);

			var user = await _userManager.FindByEmailAsync(model.Email);
			if (user != null)
			{
				TempData["Error"] = "This email address is already in use.";
				return View(model);
			}

			var newUser = new User()
			{
				Email = model.Email,
				UserName = model.Username,
				EmailConfirmed = true,
			};

			var newUserResponce = await _userManager.CreateAsync(newUser, model.Password);
			if (!newUserResponce.Succeeded)
			{
				TempData["Error"] = newUserResponce.Errors.First().Description;
				return View(model);
			}

			await _signInManager.SignInAsync(newUser, model.RememberPassword);

			if (model.ReturnUrl != null)
			{
				return LocalRedirect(model.ReturnUrl);
			}
			else
			{
				return RedirectToAction(nameof(WorkspaceController.Index), nameof(WorkspaceController).Replace("Controller", ""));
			}
		}

		public IActionResult Login(string? returnUrl = null) => View(new LoginViewModel() { ReturnUrl = returnUrl });

		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> Login(LoginViewModel model)
		{
			if (!ModelState.IsValid) return View(model);

			var user = await _userManager.FindByEmailAsync(model.Email);
			if (user != null)
			{
				var passwordCheck = await _userManager.CheckPasswordAsync(user, model.Password);
				if (passwordCheck)
				{
					var result = await _signInManager.PasswordSignInAsync(user, model.Password, model.RememberPassword, false);
					if (result.Succeeded)
					{
						if (model.ReturnUrl != null)
						{
							return LocalRedirect(model.ReturnUrl);
						}
						else
						{
							return RedirectToAction(nameof(WorkspaceController.Index), nameof(WorkspaceController).Replace("Controller", ""));
						}
					}
				}
			}
			TempData["Error"] = "Wrong credentials. Please try again.";
			return View(model);
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
		public IActionResult ChangePassword() => View(new ChangePasswordViewModel());

		[HttpPost]
		[Authorize]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> ChangePassword(ChangePasswordViewModel model)
		{
			if (!ModelState.IsValid) return View(model);

			var user = await _userManager.GetUserAsync(User);
			if (user == null)
			{
				ModelState.AddModelError(string.Empty, "Wrong user claim principal.");
				return View();
			}

			var passwordCheck = await _userManager.CheckPasswordAsync(user, model.OldPassword);
			if (!passwordCheck)
			{
				ModelState.AddModelError(string.Empty, "Old password is incorrect.");
				return View();
			}

			var token = await _userManager.GeneratePasswordResetTokenAsync(user!);
			var result = await _userManager.ResetPasswordAsync(user!, token, model.NewPassword);
			if (!result.Succeeded)
			{
				ModelState.AddModelError(string.Empty, "Fail change password.");
				return View();
			}

			if (model.ReturnUrl != null) return LocalRedirect(model.ReturnUrl);
			else return RedirectToAction("Index", "Home");
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
