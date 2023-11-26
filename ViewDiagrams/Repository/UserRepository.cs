using ViewDiagrams.Models;
using ViewDiagrams.Models.Database;

namespace ViewDiagrams.Repository
{
    public class UserRepository : IRepository<User>
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public void Create(User entity)
        {
            _context.Users.Add(entity);
            _context.SaveChanges();
        }

        public void Delete(User entity)
        {
            _context.Users.Remove(entity);
            _context.SaveChanges();
        }

        public User Get(int id)
        {
            return _context.Users.Single(x => x.Id == id);
        }

        public User Get(Func<User, bool> selector)
        {
            return _context.Users.Single(selector);
        }

        public IEnumerable<User> GetByName(string name)
        {
            return Select(x => x.UserName == name);
        }

        public IEnumerable<User> Select(Func<User, bool> selector)
        {
            return _context.Users.Where(selector);
        }
    }
}
