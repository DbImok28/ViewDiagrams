using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Diagnostics;
using System.Text.Json;
using ViewDiagrams.Models;
using ViewDiagrams.Models.ViewModel;

namespace ViewDiagrams.Controllers
{
	public class WorkspaceController : Controller
	{
		public Settings Settings { get; set; } = new Settings();
		private readonly ILogger<WorkspaceController> _logger;

		public WorkspaceController(ILogger<WorkspaceController> logger)
		{
			_logger = logger;
		}

		public IActionResult Index()
		{
			ViewBag.Settings = Settings;
			return View();
		}

		[HttpPost]
		public IActionResult SaveSettings([FromBody] string jsonSettings)
		{
			var settings = JsonSerializer.Deserialize<Settings>(jsonSettings);
			if (settings != null)
			{
				Settings = settings;
			}
			return Ok();
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