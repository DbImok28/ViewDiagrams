using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ViewDiagrams.Hubs;
using ViewDiagrams.Models;

namespace ViewDiagrams
{
	public class Program
	{
		public static void Main(string[] args)
		{
			var builder = WebApplication.CreateBuilder(args);

			builder.Services.AddControllers(options =>
			{
				options.InputFormatters.Insert(0, new RawJsonBodyInputFormatter());
			});
			builder.Services.AddControllersWithViews();
			var s = builder.Configuration.GetConnectionString("DefaultConnection");
			builder.Services.AddDbContext<ApplicationDbContext>(options =>
			{
				options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
			});

			builder.Services.AddIdentity<User, IdentityRole<int>>(options =>
			{
				options.Password.RequireDigit = false;
				options.Password.RequireLowercase = false;
				options.Password.RequireUppercase = false;
				options.Password.RequireNonAlphanumeric = false;
				options.Password.RequiredLength = 1;

				options.SignIn.RequireConfirmedEmail = false;
				options.SignIn.RequireConfirmedAccount = false;
				options.User.RequireUniqueEmail = true;
			}).AddEntityFrameworkStores<ApplicationDbContext>();
			builder.Services.AddMemoryCache();
			builder.Services.AddSession();
			builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
				.AddCookie();
			//builder.Services.AddDefaultIdentity<User>()
			//    .AddEntityFrameworkStores<ApplicationDbContext>();
			//builder.Services.AddIdentity<User, IdentityRole>(options =>
			//{
			//    options.User.RequireUniqueEmail = false;
			//});

			builder.Services.AddSignalR();

			var app = builder.Build();

			// Configure the HTTP request pipeline.
			if (!app.Environment.IsDevelopment())
			{
				app.UseExceptionHandler("/Home/Error");
				// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
				app.UseHsts();
			}

			app.UseHttpsRedirection();
			app.UseStaticFiles();

			app.UseRouting();

			app.UseAuthorization();

			app.MapControllerRoute(
				name: "default",
				pattern: "{controller=WorkSpace}/{action=Index}/{id?}");

			app.MapHub<WorkspaceHub>("/api/workspace");

			app.Run();
		}
	}
}