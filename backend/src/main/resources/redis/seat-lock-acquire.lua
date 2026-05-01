local ttl = tonumber(ARGV[1])
local userId = ARGV[2]
for i = 1, #KEYS do
    local ok = redis.call('SET', KEYS[i], userId, 'NX', 'EX', ttl)
    if not ok then
        for j = 1, i - 1 do
            redis.call('DEL', KEYS[j])
        end
        return 0
    end
end
return 1
