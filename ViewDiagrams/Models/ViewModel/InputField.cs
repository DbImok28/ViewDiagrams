namespace ViewDiagrams.Models.ViewModel
{
    public class InputField
    {
        public InputField(string name, string value, bool isReadOnly = false, InputControlState state = InputControlState.None)
        {
            Name = name;
            Value = value;
            IsReadOnly = isReadOnly;
            State = state;
        }

        public string Name { get; set; }
        public string Value { get; set; }
        public bool IsReadOnly { get; set; }
        public InputControlState State { get; set; }
    }
}
