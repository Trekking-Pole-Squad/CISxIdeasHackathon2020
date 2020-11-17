import pickle
from math import cos



class Bin:
  def __init__(self, lat, lon):
    self.lat = lat
    self.lon = lon

class BinRetriever():
    def __init__(self):
        self.bins = pickle.load(open("bins.pickle","rb"))

    def add(self, long, lat):
        self.bins.append(Bin(lat, lon))
        pickle.dump(self.bins,open("bins.pickle","wb+"))

    def near(self, lat, lon, rng_lat):
        return_value = []
        rng_lon = 40075 * cos(lat) / 360
        for bin in self.bins:
            if _compare_range(bin.lon, lon, rng_lon) and _compare_range(bin.lat, lat, rng_lat):
                return_value.append(bin)
        return return_value

    def _compare_range(loc1, loc2, distance):
            if loc1 <= loc2 + distance and loc1 >= loc2 - distance:
                return True
            else:
                return False

