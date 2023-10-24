using Microsoft.AspNetCore.Mvc;
using System;
using System.Diagnostics;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Text.Unicode;
using System.Threading.Channels;
using ViewDiagrams.Models;

namespace ViewDiagrams.Controllers
{
    public class WorkSpaceController : Controller
    {
        public Settings Settings { get; set; } = new Settings();
        private readonly ILogger<WorkSpaceController> _logger;

        public WorkSpaceController(ILogger<WorkSpaceController> logger)
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