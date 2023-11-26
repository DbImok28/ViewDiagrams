namespace ViewDiagrams.Repository
{
    public interface IRepository<T>
    {
        public void Create(T entity);
        public void Delete(T entity);
        public T Get(int id);
        public T Get(Func<T, bool> selector);
        public IEnumerable<T> Select(Func<T, bool> selector);
    }
}
