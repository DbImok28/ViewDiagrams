using ViewDiagrams.Models.Database;

namespace ViewDiagrams.Repository
{
    public class ChatRepository : IRepository<ChatMessage>
    {
        private readonly ApplicationDbContext _context;

        public ChatRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public void Create(ChatMessage entity)
        {
            _context.ChatMessages.Add(entity);
            _context.SaveChanges();
        }

        public void Delete(ChatMessage entity)
        {
            _context.ChatMessages.Remove(entity);
            _context.SaveChanges();
        }

        public ChatMessage Get(int id)
        {
            return Get(x => x.Id == id);
        }

        public ChatMessage Get(Func<ChatMessage, bool> selector)
        {
            return _context.ChatMessages.Single(selector);
        }

        public IEnumerable<ChatMessage> SelectByUserId(int userId)
        {
            return Select(x => x.UserId == userId);
        }

        public IEnumerable<ChatMessage> SelectByWorkspaceId(int workspaceId)
        {
            return Select(x => x.WorkspaceId == workspaceId);
        }

        public IEnumerable<ChatMessage> Select(Func<ChatMessage, bool> selector)
        {
            return _context.ChatMessages.Where(selector);
        }
    }
}
