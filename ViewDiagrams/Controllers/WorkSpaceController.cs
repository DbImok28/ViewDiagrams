using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using ViewDiagrams.Models;
using ViewDiagrams.Models.Helpers;
using ViewDiagrams.Models.Repository;
using ViewDiagrams.Models.ViewModel;

namespace ViewDiagrams.Controllers
{
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

        public IActionResult Index(int? id)
        {
            Workspace workspace;
            if (id != null)
            {
                workspace = _workspaceRepository.GetWorkspace(id.Value) ?? new Workspace();
            }
            else
            {
                workspace = new Workspace();
            }
            ViewBag.Workspace = workspace;
            return View();
        }

        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateWorkspaceViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var workspaceId = _workspaceRepository.Create(model.Name, User.GetUserId());
            return RedirectToAction(nameof(Index), nameof(WorkspaceController).Replace("Controller", ""));
        }

        public IActionResult Privacy()
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