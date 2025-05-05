using System;
using System.Configuration;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Diagnostics;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using DoAn_LapTrinhWeb.Models;

namespace BaiTap.Service
{
    public class MomoService : IMomoService
    {
        private readonly string _partnerCode;
        private readonly string _accessKey;
        private readonly string _secretKey;
        private readonly string _endpoint;
        private readonly string _ipnUrl;
        private readonly string _returnUrl;

        public string AccessKey => _accessKey;

        public MomoService()
        {
            try
            {
                _partnerCode = ConfigurationManager.AppSettings["MomoPartnerCode"];
                _accessKey = ConfigurationManager.AppSettings["MomoAccessKey"];
                _secretKey = ConfigurationManager.AppSettings["MomoSecretKey"];
                _endpoint = ConfigurationManager.AppSettings["MomoEndpoint"];
                _ipnUrl = ConfigurationManager.AppSettings["NotifyUrl"];
                _returnUrl = ConfigurationManager.AppSettings["ReturnUrl"];

                Debug.WriteLine($"MomoService Configuration - partnerCode: {_partnerCode}, accessKey: {_accessKey}, endpoint: {_endpoint}, returnUrl: {_returnUrl}, ipnUrl: {_ipnUrl}");

                if (string.IsNullOrEmpty(_partnerCode) || string.IsNullOrEmpty(_accessKey) ||
                    string.IsNullOrEmpty(_secretKey) || string.IsNullOrEmpty(_endpoint) ||
                    string.IsNullOrEmpty(_ipnUrl) || string.IsNullOrEmpty(_returnUrl))
                {
                    throw new Exception("Cấu hình MoMo bị thiếu hoặc không hợp lệ");
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Lỗi khi khởi tạo MomoService: {ex.Message}");
                throw;
            }
        }

        public async Task<MomoCreatePaymentResponseModel> CreatePaymentAsync(OrderInfoModel model)
        {
            try
            {
                var requestId = Guid.NewGuid().ToString();
                var uniqueOrderId = $"{model.OrderId}_{requestId}";

                var parameters = new Dictionary<string, string>
                {
                    {"accessKey", _accessKey},
                    {"amount", model.Amount.ToString()},
                    {"extraData", ""},
                    {"ipnUrl", _ipnUrl},
                    {"orderId", uniqueOrderId},
                    {"orderInfo", model.OrderInfo},
                    {"partnerCode", _partnerCode},
                    {"redirectUrl", _returnUrl},
                    {"requestId", requestId},
                    {"requestType", "captureWallet"}
                };

                var rawSignature = CreateRawSignature(parameters);
                Debug.WriteLine($"Raw Signature (CreatePaymentAsync): {rawSignature}");

                var signature = ComputeHmacSha256(rawSignature, _secretKey);
                Debug.WriteLine($"Generated Signature (CreatePaymentAsync): {signature}");

                var requestBody = new
                {
                    partnerCode = _partnerCode,
                    partnerName = "Test",
                    storeId = "MomoTestStore",
                    requestId,
                    amount = model.Amount,
                    orderId = uniqueOrderId,
                    orderInfo = model.OrderInfo,
                    redirectUrl = _returnUrl,
                    ipnUrl = _ipnUrl,
                    lang = "vi",
                    requestType = "captureWallet",
                    autoCapture = true,
                    extraData = "",
                    signature
                };

                var jsonRequest = JsonConvert.SerializeObject(requestBody);
                Debug.WriteLine($"Request Body (CreatePaymentAsync): {jsonRequest}");

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Add("Accept", "application/json");
                    var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                    Debug.WriteLine($"Gửi yêu cầu tới: {_endpoint}");
                    var response = await client.PostAsync(_endpoint, content);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    Debug.WriteLine($"Trạng thái phản hồi (CreatePaymentAsync): {response.StatusCode}");
                    Debug.WriteLine($"Nội dung phản hồi (CreatePaymentAsync): {responseContent}");

                    if (!response.IsSuccessStatusCode)
                    {
                        throw new Exception($"Yêu cầu HTTP thất bại với mã trạng thái: {response.StatusCode}, Nội dung: {responseContent}");
                    }

                    var responseObject = JObject.Parse(responseContent);
                    var result = new MomoCreatePaymentResponseModel
                    {
                        RequestId = responseObject["requestId"]?.ToString(),
                        ErrorCode = int.Parse(responseObject["resultCode"]?.ToString() ?? "-1"),
                        OrderId = responseObject["orderId"]?.ToString(),
                        Message = responseObject["message"]?.ToString() ?? "Lỗi không xác định",
                        PayUrl = responseObject["payUrl"]?.ToString(),
                        QrCodeUrl = responseObject["qrCodeUrl"]?.ToString(),
                        Signature = responseObject["signature"]?.ToString()
                    };

                    Debug.WriteLine($"Phản hồi đã phân tích (CreatePaymentAsync): {JsonConvert.SerializeObject(result)}");
                    return result;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Lỗi trong CreatePaymentAsync: {ex.Message}");
                return new MomoCreatePaymentResponseModel
                {
                    ErrorCode = -1,
                    Message = ex.Message
                };
            }
        }

        public MomoExecuteResponseModel PaymentExecuteAsync(HttpRequestBase request)
        {
            var form = request.Form;
            Debug.WriteLine($"Dữ liệu biểu mẫu (PaymentExecuteAsync): {string.Join(", ", form.AllKeys.Select(k => $"{k}={form[k]}"))}");

            return new MomoExecuteResponseModel
            {
                PartnerCode = request["partnerCode"],
                OrderId = request["orderId"],
                RequestId = request["requestId"],
                Amount = long.TryParse(request["amount"], out var amount) ? amount : 0,
                OrderInfo = request["orderInfo"],
                OrderType = request["orderType"] ?? "momo_wallet",
                TransId = request["transId"],
                ErrorCode = int.TryParse(request["resultCode"], out var resultCode) ? resultCode : -1,
                Message = request["message"],
                PayType = request["payType"] ?? "web",
                ResponseTime = long.TryParse(request["responseTime"], out var responseTime) ? responseTime : 0,
                ExtraData = request["extraData"] ?? "",
                Signature = request["signature"]
            };
        }

        public bool VerifySignature(Dictionary<string, string> parameters, string signature)
        {
            // Sắp xếp tham số theo thứ tự bảng chữ cái
            var sortedParams = parameters.OrderBy(p => p.Key);
            var rawData = string.Join("&", sortedParams.Select(p => $"{p.Key}={p.Value}"));
            var secretKey = ConfigurationManager.AppSettings["MomoSecretKey"];
            using (var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(secretKey)))
            {
                var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(rawData));
                var computedSignature = BitConverter.ToString(hash).Replace("-", "").ToLower();
                System.Diagnostics.Debug.WriteLine($"RawData: {rawData}");
                System.Diagnostics.Debug.WriteLine($"Computed Signature: {computedSignature}");
                System.Diagnostics.Debug.WriteLine($"Received Signature: {signature}");
                return computedSignature == signature;
            }
        }

        public async Task<(bool Success, string Message)> QueryTransaction(string orderId, string requestId)
        {
            try
            {
                var parameters = new Dictionary<string, string>
                {
                    {"accessKey", _accessKey},
                    {"partnerCode", _partnerCode},
                    {"requestId", requestId},
                    {"orderId", orderId}
                };

                var rawSignature = CreateRawSignatureForQuery(parameters);
                Debug.WriteLine($"Raw Signature (QueryTransaction): {rawSignature}");

                var signature = ComputeHmacSha256(rawSignature, _secretKey);
                Debug.WriteLine($"Generated Signature (QueryTransaction): {signature}");

                var requestBody = new
                {
                    partnerCode = _partnerCode,
                    requestId,
                    orderId,
                    lang = "vi",
                    signature
                };

                var jsonRequest = JsonConvert.SerializeObject(requestBody);
                Debug.WriteLine($"QueryTransaction Request Body: {jsonRequest}");

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Add("Accept", "application/json");
                    var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                    var queryEndpoint = "https://test-payment.momo.vn/v2/gateway/api/query";
                    Debug.WriteLine($"Gửi yêu cầu QueryTransaction tới: {queryEndpoint}");
                    var response = await client.PostAsync(queryEndpoint, content);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    Debug.WriteLine($"Trạng thái phản hồi QueryTransaction: {response.StatusCode}");
                    Debug.WriteLine($"Nội dung phản hồi QueryTransaction: {responseContent}");

                    if (!response.IsSuccessStatusCode)
                    {
                        throw new Exception($"QueryTransaction thất bại với mã trạng thái: {response.StatusCode}, Nội dung: {responseContent}");
                    }

                    var responseObject = JObject.Parse(responseContent);
                    var resultCode = responseObject["resultCode"]?.ToString();
                    var message = responseObject["message"]?.ToString() ?? "Lỗi không xác định";

                    Debug.WriteLine($"Mã kết quả QueryTransaction: {resultCode}, Thông báo: {message}");

                    if (resultCode == "0")
                    {
                        var transId = responseObject["transId"]?.ToString();
                        if (!string.IsNullOrEmpty(transId))
                        {
                            return (true, "Thanh toán thành công");
                        }
                        return (false, "Giao dịch chưa hoàn tất");
                    }

                    return (false, $"Lỗi MoMo: {message}. Mã kết quả: {resultCode}");
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Lỗi trong QueryTransaction: {ex.Message}");
                return (false, ex.Message);
            }
        }

        private string CreateRawSignature(Dictionary<string, string> parameters)
        {
            var sortedParams = parameters.OrderBy(x => x.Key)
                                       .Select(x => $"{x.Key}={x.Value}");
            return string.Join("&", sortedParams);
        }

        private string CreateRawSignatureForQuery(Dictionary<string, string> parameters)
        {
            return $"accessKey={parameters["accessKey"]}&orderId={parameters["orderId"]}&partnerCode={parameters["partnerCode"]}&requestId={parameters["requestId"]}";
        }

        private string ComputeHmacSha256(string message, string secretKey)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            var messageBytes = Encoding.UTF8.GetBytes(message);

            using (var hmac = new HMACSHA256(keyBytes))
            {
                var hashBytes = hmac.ComputeHash(messageBytes);
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }
        }
    }
}