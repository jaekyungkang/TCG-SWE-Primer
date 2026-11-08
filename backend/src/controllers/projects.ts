import { Request, Response } from "express";
import { supabase } from "../app";

// Check section 1-2 in the README for more details on how to create this controller.

// helper
const checkUserExists = async (userId: number): Promise<boolean> => {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
};

// Get project by ID
// GET /project/:id - Get project by ID
export const getProjectById = async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
    if (error) {
        console.error("Error fetching project by ID:", error);
        return res.status(500).json({ error: "Failed to fetch project" });
    }
    return res.json(data);
};

// Get all projects
export const getAllProjects = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("projects")
    .select("*");

  if (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ error: "Failed to fetch projects" });
  }

  return res.status(200).json(data);
};

// Create a new project
export const createProject = async (req: Request, res: Response) => {
  const { name, managerId, description } = req.body;

  if (!name || !Number.isSafeInteger(managerId) || managerId <= 0 ||
      typeof description !== "string") {
    return res.status(400).json({ error: "Invalid or missing fields" });
  }

  try {
    const userExists = await checkUserExists(managerId);

    if (!userExists) {
      return res.status(404).json({ error: "Manager does not exist" });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        project_name: name,
        project_manager_id: managerId,
        project_description: description,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ error: "Failed to create project" });
  }
};

// Update a project
export const updateProject = async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const { name, managerId, description } = req.body;

  try {
    const updates: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Invalid project name" });
      }
      updates.project_name = name;
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({ error: "Invalid description" });
      }
      updates.project_description = description;
    }

    if (managerId !== undefined) {
      if (!Number.isSafeInteger(managerId) || managerId <= 0) {
        return res.status(400).json({ error: "Invalid manager ID" });
      }

      const userExists = await checkUserExists(managerId);

      if (!userExists) {
        return res.status(404).json({ error: "Manager does not exist" });
      }

      updates.project_manager_id = managerId;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", projectId)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({ error: "Failed to update project" });
  }
};

// Delete a project
export const deleteProject = async (req: Request, res: Response) => {
  const projectId = req.params.id;

  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ error: "Failed to delete project" });
  }

  if (!data) {
    return res.status(404).json({ error: "Project not found" });
  }

  return res.status(200).json(data);
};