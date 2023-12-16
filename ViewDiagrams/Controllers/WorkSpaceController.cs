using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using ViewDiagrams.Models;
using ViewDiagrams.Models.Database;
using ViewDiagrams.Models.Helpers;
using ViewDiagrams.Models.ViewModel;
using ViewDiagrams.Repository;

namespace ViewDiagrams.Controllers
{
	[Authorize]
	public class WorkspaceController : Controller
	{
		private readonly ILogger<WorkspaceController> _logger;
		private readonly WorkspaceRepository _workspaceRepository;
		private readonly UserManager<User> _userManager;

		public WorkspaceController(ILogger<WorkspaceController> logger, ApplicationDbContext context, UserManager<User> userManager)
		{
			_logger = logger;
			_workspaceRepository = new WorkspaceRepository(context);
			_userManager = userManager;
		}

		[AllowAnonymous]
		public IActionResult Index(int? id)
		{
			if (id == null) return RedirectToAction(nameof(AccountController.Profile), nameof(AccountController).Replace("Controller", ""));

			var workspace = _workspaceRepository.Get(id.Value);
			if (workspace == null) return WorkspaceNotExist();
			ViewBag.Workspace = workspace;

			var role = _workspaceRepository.GetUserRole(User, workspace.Id);
			if (role == WorkspaceUserRole.Guest)
			{
				if (workspace.IsPublic)
				{
					ViewBag.IsGuest = true;
					ViewBag.IsAdmin = false;
					return View();
				}
				else
				{
					return WorkspaceNotExist();
				}
			}
			ViewBag.IsGuest = false;

			if (role == WorkspaceUserRole.Admin)
			{
				ViewBag.IsAdmin = true;
				_workspaceRepository.LoadUsers(workspace);
			}
			else
			{
				ViewBag.IsAdmin = false;
			}
			return View();
		}

		[NonAction]
		public IActionResult WorkspaceNotExist()
		{
			return View(nameof(UserError), "This workspace does not exist or access is not available.");
		}

		public IActionResult Create()
		{
			if (User.Identity == null || !User.Identity.IsAuthenticated)
				return RedirectToAction(nameof(AccountController.Login), nameof(AccountController).Replace("Controller", ""));
			return View();
		}

		[HttpPost]
		public IActionResult Create(CreateWorkspaceViewModel model)
		{
			if (!ModelState.IsValid) return View(model);

			var userId = User.GetUserId();
			if (userId == null) return RedirectToAction(nameof(AccountController.Login), nameof(AccountController).Replace("Controller", ""));

			var workspaceId = _workspaceRepository.Create(model.Name, userId.Value);
			return RedirectToAction(nameof(Index), nameof(WorkspaceController).Replace("Controller", ""), new { id = workspaceId });
		}

		public IActionResult Privacy()
		{
			return View();
		}
		public IActionResult UserError()
		{
			return View();
		}

		[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
		public IActionResult Error()
		{
			return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
		}
	}
}