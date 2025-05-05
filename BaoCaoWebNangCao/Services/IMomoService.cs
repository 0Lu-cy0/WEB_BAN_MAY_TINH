using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;
using DoAn_LapTrinhWeb.Models;

namespace BaiTap.Service
{
    public interface IMomoService
    {
        Task<MomoCreatePaymentResponseModel> CreatePaymentAsync(OrderInfoModel model);
        MomoExecuteResponseModel PaymentExecuteAsync(HttpRequestBase request);
        bool VerifySignature(Dictionary<string, string> parameters, string receivedSignature);
        Task<(bool Success, string Message)> QueryTransaction(string orderId, string requestId);
        string AccessKey { get; }
    }
}