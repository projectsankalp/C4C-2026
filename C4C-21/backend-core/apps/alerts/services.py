class AlertService:

    @staticmethod
    def analyze_risk(data):

        water_level = data.get("water_level", 0)
        soil_moisture = data.get("soil_moisture", 0)
        temperature = data.get("temperature", 0)

        if water_level > 8:
            return "HIGH FLOOD RISK"

        elif soil_moisture < 20 and temperature > 35:
            return "DROUGHT RISK"

        else:
            return "NORMAL"