using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ViewDiagrams.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkspaceIdToChatMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WorkspaceId",
                table: "ChatMessages",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_WorkspaceId",
                table: "ChatMessages",
                column: "WorkspaceId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_Workspaces_WorkspaceId",
                table: "ChatMessages",
                column: "WorkspaceId",
                principalTable: "Workspaces",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_Workspaces_WorkspaceId",
                table: "ChatMessages");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessages_WorkspaceId",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "WorkspaceId",
                table: "ChatMessages");
        }
    }
}
