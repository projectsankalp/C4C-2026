import xgboost as xgb

class Predictor:
    def __init__(self, model_path=None):
        self.model = xgb.XGBRegressor()
        if model_path:
            self.model.load_model(model_path)

    def forecast(self, data):
        # Predict groundwater levels
        return self.model.predict(data)
