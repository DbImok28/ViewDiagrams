namespace ViewDiagrams.Models.ViewModel
{
    public class CheckBox
    {
        public CheckBox(string name, bool value)
        {
            Name = name;
            Value = value;
        }

        public string Name { get; set; }
        public bool Value { get; set; }
    }
}
