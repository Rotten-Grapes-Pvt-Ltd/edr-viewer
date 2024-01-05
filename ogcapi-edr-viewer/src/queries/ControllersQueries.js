import { getApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const GetCollections = (url) => {
  return useQuery({
    queryKey: [url],
    queryFn: () => getApi(url),
    enabled: !!url,
  });
};

export const GetLocations = (url) => {
  return useQuery({
    queryKey: [url],
    queryFn: () => getApi(url),
    enabled: !!url,
  });
};
