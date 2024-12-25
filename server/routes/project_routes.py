from flask import Blueprint, g, request, jsonify
from controllers.project_contoller import save_project, get_projects
from middleware.auth import auth_middleware

project_routes = Blueprint("project_routes", __name__)

# Attach the middleware to the blueprint
@project_routes.before_request
def use_auth_middleware():
    # Print method and headers for debugging
    # print(f"Request headers: {request.headers}")

    # Skip middleware for preflight OPTIONS requests
    if request.method == "OPTIONS":
        return '', 204

    # Proceed with auth middleware for other requests
    response = auth_middleware()()
    if response:
        return response


# Define routes
@project_routes.route("/api/save_project", methods=["OPTIONS", "POST"])
def save_project_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_project logic
    return save_project()


@project_routes.route("/api/get_projects", methods=["GET"])
def get_projects_route():
    # Access `g.user_id` for user ID extracted from the token
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204
    
    return get_projects()
