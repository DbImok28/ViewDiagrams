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

        //[Route("/ws")]
        //public async Task Sync()
        //{
        //    if (HttpContext.WebSockets.IsWebSocketRequest)
        //    {
        //        using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
        //        await Echo(webSocket);
        //    }
        //    else
        //    {
        //        HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        //    }
        //}

        //public async Task SyncWorkspaces(List<WebSocket> connections)
        //{
        //    foreach (var connection in connections)
        //    {
        //        SyncWorkspace(connection);
        //    }
        //}

        //public async Task SyncWorkspace(WebSocket connection)
        //{
        //    var message = await ReceiveStringAsync(connection);
        //    if (message != null)
        //    {

        //    }
        //}

        //public async Task Broadcast(List<WebSocket> connections, string message)
        //{
        //    var bytes = Encoding.UTF8.GetBytes(message);
        //    foreach (var socket in connections)
        //    {
        //        if (socket.State == WebSocketState.Open)
        //        {
        //            var arraySegment = new ArraySegment<byte>(bytes, 0, bytes.Length);
        //            await socket.SendAsync(arraySegment, WebSocketMessageType.Text, true, CancellationToken.None);
        //        }
        //    }
        //}

        //private static Task SendStringAsync(WebSocket socket, string data, CancellationToken ct = default)
        //{
        //    var buffer = Encoding.UTF8.GetBytes(data);
        //    var segment = new ArraySegment<byte>(buffer);
        //    return socket.SendAsync(segment, WebSocketMessageType.Text, true, ct);
        //}

        //private static async Task<string> ReceiveStringAsync(WebSocket socket, CancellationToken ct = default)
        //{
        //    var buffer = new ArraySegment<byte>(new byte[8192]);
        //    using (var ms = new MemoryStream())
        //    {
        //        WebSocketReceiveResult result;
        //        do
        //        {
        //            ct.ThrowIfCancellationRequested();

        //            result = await socket.ReceiveAsync(buffer, ct);
        //            ms.Write(buffer.Array, buffer.Offset, result.Count);
        //        }
        //        while (!result.EndOfMessage);

        //        ms.Seek(0, SeekOrigin.Begin);
        //        if (result.MessageType != WebSocketMessageType.Text)
        //            throw new Exception("Unexpected message");

        //        using (var reader = new StreamReader(ms, Encoding.UTF8))
        //        {
        //            return await reader.ReadToEndAsync();
        //        }
        //    }
        //}

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