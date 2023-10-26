using Microsoft.EntityFrameworkCore;

namespace ViewDiagrams.Models
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<AccessSettings> AccessSettings { get; set; }
        public DbSet<Settings> Settings { get; set; }
        public DbSet<Workspace> Workspaces { get; set; }
    }
}
