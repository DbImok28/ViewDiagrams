using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ViewDiagrams.Models.Database
{
    public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder
            .Entity<Workspace>()
            .HasMany(c => c.Users)
            .WithMany(s => s.Workspaces)
            .UsingEntity<WorkspaceUser>(
               j => j
                .HasOne(pt => pt.User)
                .WithMany(t => t.WorkspaceUsers)
                .HasForeignKey(pt => pt.UserId),
            j => j
                .HasOne(pt => pt.Workspace)
                .WithMany(p => p.WorkspaceUsers)
                .HasForeignKey(pt => pt.WorkspaceId),
            j =>
            {
                //j.Property(pt => pt.Mark).HasDefaultValue(3);
                j.HasKey(t => new { t.WorkspaceId, t.UserId });
                j.ToTable("WorkspaceUsers");
            });
            base.OnModelCreating(modelBuilder);
        }

        public DbSet<WorkspaceUser> WorkspaceUsers { get; set; }
        public DbSet<Workspace> Workspaces { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
    }
}
