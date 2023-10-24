using Microsoft.AspNetCore.SignalR;

namespace ViewDiagrams.Hubs
{
    public class WorkspaceHub : Hub
    {
        public async Task Sink(string data)
        {
            await Clients.Others.SendAsync("Update", data);
        }
    }
}
