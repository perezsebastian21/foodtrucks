using rsCPO.Models;
using rsFoodtrucks.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace rsFoodtrucks.DataAccess.Interfaces
{
    public interface IRepositoryAsync<T>: IDisposable where T : class
    {
        Task<IEnumerable<T>> GetAll();
        Task<T> GetByID(int? id);
        Task<T> Insert(T entity);
        Task<T> Delete(int id);
        Task Update(T entity);
        Task<T> Find(Expression<Func<T, bool>> expr);

        Task<IEnumerable<TResult>> GetAllDTO<TResult>(Expression<Func<T, bool>>? criterio, Expression<Func<T, TResult>>? selector,  bool? orderbydescendin,PageInfo? pageInfo ,params Expression<Func<T, Object>>[]? order) where TResult : class;

        Task<IEnumerable<TResult>> GetAllDTO2<TResult>(Expression<Func<T, bool>>? criterio, Expression<Func<T, TResult>>? selector, bool? orderbydescendin, int? page, int? limit, params Expression<Func<T, Object>>[]? order) where TResult : class;

        Task AddWithImage(T entity);

        Task AddWithImageFS(T entity);

        Task Add(T entity);

        public int Count(Expression<Func<T, bool>>? criterio);


        private class OrderByClass
        {

            public OrderByClass()
            {

            }

            public OrderByClass(Func<T, object> orderBy, bool isAscending)
            {
                OrderBy = orderBy;
                IsAscending = isAscending;
            }


            public Func<T, object> OrderBy { get; set; }
            public bool IsAscending { get; set; }
        }
    }
}