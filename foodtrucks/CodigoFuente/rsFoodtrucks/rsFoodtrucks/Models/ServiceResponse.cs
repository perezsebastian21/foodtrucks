namespace rsFoodtrucks.Models
{
    public class ServiceResponse<T>
    {
        public ServiceResponse(T _data)
        {
            Data = _data;
        }
        public T Data { get; set; }
        public bool Success { get; set; } = true;
        public string ErrorMessage { get; set; } = null;

        //aca para pulir el modelo se podria agragar una lista de errores de diferentes tipos, podria ser un clave valor 
        //cod_error description resta definirlo
    }
}
