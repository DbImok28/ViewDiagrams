using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ViewDiagrams.Migrations
{
    /// <inheritdoc />
    public partial class AddIsAdminFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAdmin",
                table: "WorkspaceUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAdmin",
                table: "WorkspaceUsers");
        }
    }
}
