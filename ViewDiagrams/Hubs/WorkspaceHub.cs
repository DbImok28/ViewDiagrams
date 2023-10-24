using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using ViewDiagrams.Models;

namespace ViewDiagrams.Hubs
{
    public class WorkspaceHub : Hub
    {
        public async Task Sink(string data)
        {
            // TODO: Store workspace
            if (Context.Items["WorkspaceId"] is string workspaceId)
            {
                await Clients.OthersInGroup(workspaceId).SendAsync("Update", data);
            }
        }

        public async Task Pull()
        {
            // TODO: Load workspace
            string settingsAsJson = JsonSerializer.Serialize(new Settings());
            if (settingsAsJson != null)
            {
                await Clients.Caller.SendAsync("Update", settingsAsJson);
            }
        }

        public async Task Join(string workspaceId)
        {
            // TODO: Check workspace access
            await Leave();
            Context.Items["WorkspaceId"] = workspaceId;
            await Groups.AddToGroupAsync(Context.ConnectionId, workspaceId);
        }

        public async Task Leave()
        {
            if (Context.Items["WorkspaceId"] is string workspaceId)
            {
                Context.Items.Remove(workspaceId);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, workspaceId);
            }
        }

    }
}
