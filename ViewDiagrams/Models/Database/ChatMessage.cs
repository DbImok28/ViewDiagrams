using System.ComponentModel.DataAnnotations;

namespace ViewDiagrams.Models.Database
{
    public class ChatMessage
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public int WorkspaceId { get; set; }
        public Workspace Workspace { get; set; }

        public DateTime SendDate { get; set; }
        public string Content { get; set; }
    }
}
