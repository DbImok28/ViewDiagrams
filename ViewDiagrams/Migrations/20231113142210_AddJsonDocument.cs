using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ViewDiagrams.Migrations
{
    /// <inheritdoc />
    public partial class AddJsonDocument : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DocumentInJson",
                table: "Workspaces",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocumentInJson",
                table: "Workspaces");
        }
    }
}
