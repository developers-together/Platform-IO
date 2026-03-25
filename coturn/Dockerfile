FROM coturn/coturn:latest

# Use environment variables or a configuration file to configure Coturn.
# By default, we use the turnserver.conf provided in this directory.
COPY turnserver.conf /etc/coturn/turnserver.conf

# Expose standard STUN/TURN ports
EXPOSE 3478/tcp
EXPOSE 3478/udp
EXPOSE 5349/tcp
EXPOSE 5349/udp

# You can also expose the Min-Max port range for TURN relay
# EXPOSE 49152-65535/udp

# Start Coturn Server
CMD ["-c", "/etc/coturn/turnserver.conf"]
