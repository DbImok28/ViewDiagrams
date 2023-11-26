using Microsoft.AspNetCore.SignalR;
using System;
using System.Text.Json;
using ViewDiagrams.Models;
using ViewDiagrams.Models.Database;
using ViewDiagrams.Models.Helpers;
using ViewDiagrams.Repository;

namespace ViewDiagrams.Hubs
{
    public class WorkspaceHub : Hub
    {
        private readonly WorkspaceHubHelpers _helper;
        private readonly ChatRepository _chatRepository;

        public WorkspaceHub(ApplicationDbContext context)
        {
            _helper = new WorkspaceHubHelpers(context);
            _chatRepository = new ChatRepository(context);
        }

        public async Task Sink(string data, string documentInJson)
        {
            int workspaceId = _helper.GetWorkspaceId(Context);
            var role = _helper.GetUserRole(Context, workspaceId);
            _helper.CheckPrivateAccess(role);

            try
            {
                var newWorkspace = JsonSerializer.Deserialize<Workspace>(data.ToString());
                if (newWorkspace == null) return;

                var oldWorkspace = _helper.GetWorkspace(workspaceId);
                _helper.Update(newWorkspace, documentInJson, role == WorkspaceUserRole.Admin, oldWorkspace);
            }
            catch (Exception e)
            {
                throw new HubException(e.Message);
            }
            await Clients.OthersInGroup(workspaceId.ToString()).SendAsync("Update", data, documentInJson);
        }

        public async Task Pull()
        {
            int workspaceId = _helper.GetWorkspaceId(Context);
            Workspace workspace = _helper.GetWorkspace(workspaceId);

            //CheckPublicAccess(workspace);

            string settingsAsJson = JsonSerializer.Serialize(workspace);
            if (settingsAsJson == null) return;
            await Clients.Caller.SendAsync("Update", settingsAsJson, workspace.DocumentInJson);
        }

        public async Task Join(string newWorkspaceId)
        {
            await Leave();

            int workspaceId = Convert.ToInt32(newWorkspaceId);
            Workspace workspace = _helper.GetWorkspace(workspaceId);

            _helper.CheckPublicAccess(Context, workspace);

            Context.Items["WorkspaceId"] = workspaceId;
            await Groups.AddToGroupAsync(Context.ConnectionId, workspaceId.ToString());
        }

        public async Task Leave()
        {
            if (Context.Items["WorkspaceId"] is int workspaceId)
            {
                Context.Items.Remove(workspaceId);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, workspaceId.ToString());
            }
        }

        public async Task UserList()
        {
            try
            {
                Workspace workspace = _helper.GetWorkspace(_helper.GetWorkspaceId(Context));
                var users = _helper.GetUsers(workspace);
                var userInJson = JsonSerializer.Serialize(users.Select(x => x.UserName));
                await Clients.Caller.SendAsync("UserListResult", userInJson);
            }
            catch (Exception e)
            {
                throw new HubException(e.Message);
            }
        }

        public void AddUser(string name)
        {
            _helper.CheckAdminAccess(Context);
            _helper.AddUser(_helper.GetWorkspaceId(Context), name);
        }

        public void RemoveUser(string name)
        {
            _helper.RemoveUser(_helper.GetWorkspaceId(Context), name);
        }

        public async Task SendMessage(string message)
        {
            try
            {
                int workspaceId = _helper.GetWorkspaceId(Context);
                var role = _helper.GetUserRole(Context, workspaceId);
                _helper.CheckPrivateAccess(role);

                var sendDate = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
                var username = Context.User!.GetUserName();

                _chatRepository.Create(new ChatMessage()
                {
                    UserId = Context.User!.GetUserId()!.Value,
                    WorkspaceId = workspaceId,
                    SendDate = sendDate,
                    Content = message
                });
                await Clients.OthersInGroup(workspaceId.ToString()).SendAsync("ReceiveMessage", username, sendDate.ToString(), message);
            }
            catch (Exception e)
            {
                throw new HubException(e.Message);
            }
        }

        public async Task GetAllMessages()
        {
            try
            {
                int workspaceId = _helper.GetWorkspaceId(Context);
                var role = _helper.GetUserRole(Context, workspaceId);
                _helper.CheckPrivateAccess(role);

                var chatMessages = _chatRepository.SelectByWorkspaceId(workspaceId);
                var users = _helper.GetUsers(_helper.GetWorkspace(workspaceId));

                foreach (var message in chatMessages)
                {
                    await Clients.Caller.SendAsync("ReceiveMessage", users.First(x => x.Id == message.UserId).UserName, message.SendDate.ToString(), message.Content);
                }
            }
            catch (Exception e)
            {
                throw new HubException(e.Message);
            }
        }
    }
}
