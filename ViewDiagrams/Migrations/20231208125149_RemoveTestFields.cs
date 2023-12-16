using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ViewDiagrams.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTestFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Test",
                table: "Workspaces");

            migrationBuilder.DropColumn(
                name: "UseTest",
                table: "Workspaces");

            migrationBuilder.DropColumn(
                name: "UseTest2",
                table: "Workspaces");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Test",
                table: "Workspaces",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "UseTest",
                table: "Workspaces",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "UseTest2",
                table: "Workspaces",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
