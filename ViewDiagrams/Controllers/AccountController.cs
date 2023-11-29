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

		public IActionResult Login(string? returnUrl = null)
		{
			return View(new LoginViewModel() { ReturnUrl = returnUrl });
		}

		[HttpPost]
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

		public IActionResult Register(string? returnUrl = null)
		{
			return View(new RegisterViewModel() { ReturnUrl = returnUrl });
		}

		[HttpPost]
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
